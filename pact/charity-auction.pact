(define-namespace
  (ns.create-principal-namespace (read-keyset 'charity-auction-keyset))
  (read-keyset 'charity-auction-keyset )
  (read-keyset 'charity-auction-keyset ))

(namespace (ns.create-principal-namespace (read-keyset 'charity-auction-keyset )))

(define-keyset
  (format "{}.{}" [(ns.create-principal-namespace (read-keyset 'charity-auction-keyset )) "charity-auction-keyset"])
  (read-keyset 'charity-auction-keyset))

(module charity-auction GOVERNANCE
  @doc "Smart Contract governing the charity auction"

  (use coin)

  (defconst NS_HASH "n_bd7f56c0bc111ea42026912c37ff5da89149d9dc")

  (defconst MINIMUM_PRECISION 12
    "Minimum allowed precision for coin transactions")

  (defcap GOVERNANCE ()
    (enforce-keyset (format "{}.charity-auction-keyset" [NS_HASH])))

  (defcap INTERNAL ()
    @doc "Internal capabilities"
    true)

  (defun auction-guard:bool () 
    (require-capability (INTERNAL)))

  (defun create-auction-guard:guard()
    @doc "Create an auction guard"
    (create-user-guard (auction-guard)))

  (defconst auction-principal
    (create-principal (keyset-ref-guard (format "{}.charity-auction-keyset" [NS_HASH]))))

  (defschema auction
    @doc "Schema for an action"
    @model [
      (invariant (> start-bid 0.0))
      (invariant (> min-bid 0.0))
      (invariant (>= current-bid 0.0))
    ]
    name        : string
    description : string
    url         : string
    bidder      : string
    start-bid   : decimal
    current-bid : decimal
    min-bid     : decimal
    start-time  : time
    end-time    : time)
  (deftable auctions:{auction})

  (defun enforce-unit:bool (amount:decimal)
    @doc "Enforce minimum precision allowed for coin transactions"

    (enforce
      (= (floor amount MINIMUM_PRECISION)
         amount)
      (format "Amount violates minimum precision: {}" [amount]))
    )
  (defun start-auction(
    name        : string
    description : string
    url         : string
    start-bid   : decimal
    min-bid     : decimal
    start-time  : time
    end-time    : time)
    @doc "Start an auction"
    @model [
      (property (!= name ""))
      (property (!= description ""))
      (property (!= url ""))
      (property (> start-bid 0.0))
      (property (> min-bid 0.0))
    ]
    (enforce (!= name "") "Name must not be empty")
    (enforce (!= description "") "Description must not be empty")
    (enforce (!= url "") "URL must not be empty")
    (enforce (> start-bid 0.0) "Start bid must be greater than 0.0")
    (enforce (> min-bid 0.0) "Minimum bid must be greater than 0.0")
    (enforce (<= min-bid start-bid) "Minimum bid must be less than or equal to start bid")
    (enforce (> start-time (at 'block-time (chain-data))) "Start time must be in the future")
    (enforce (> end-time start-time) "End time must be after start time")
    (enforce-unit start-bid)
    (enforce-unit min-bid)
    (insert auctions name 
      { 'name        : name
      , 'description : description
      , 'url         : url
      , 'start-bid   : start-bid
      , 'min-bid     : min-bid
      , 'current-bid : (- start-bid min-bid)
      , 'bidder      : ""
      , 'start-time  : start-time
      , 'end-time    : end-time }))

  (defun get-auction-escrow(name:string)
    @doc "Get the escrow account for an auction"
    (enforce (!= name "") "Name must not be empty")
    (enforce (not (contains ":" name)) "Name must not contain a colon")
    (format "{}:{}" [name auction-principal]))

  (defun bid(name:string bidder:string bid:decimal)
    @doc "Bid on an auction"
    (with-capability (INTERNAL)
      (with-read auctions name
        { 'min-bid     := min-bid
        , 'current-bid := current-bid
        , 'bidder      := current-bidder
        , 'start-time  := start-time
        , 'end-time    := end-time }
        (enforce (>= bid (+ current-bid min-bid)) "Bid must be greater than current bid plus minimum bid")
        (enforce (> (at 'block-time (chain-data)) start-time) "Auction has not started")
        (enforce (< (at 'block-time (chain-data)) end-time) "Auction has ended")
        (let ((escrow:string (get-auction-escrow name)))
          (install-capability (coin.TRANSFER escrow current-bidder current-bid))
          (if (= current-bidder "")
            "First bid"
            (coin.transfer escrow current-bidder current-bid))
          (coin.transfer-create bidder escrow (create-auction-guard) bid)
          (update auctions name
            { 'current-bid : bid
            , 'bidder      : bidder })))))
)

; Make sure that our pre-determined ns_hash has not been changed
(enforce-keyset (format "{}.charity-auction-keyset" [NS_HASH]))

(if (read-msg 'upgrade)
  ["Upgrade successful"]
  [
    (create-table auctions)
  ])

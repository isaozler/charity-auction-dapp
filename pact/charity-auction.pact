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

  (defcap GOVERNANCE ()
    (enforce-keyset (format "{}.charity-auction-keyset" [NS_HASH])))

  (defcap INTERNAL ()
    @doc "Internal capabilities"
    true)

  (defun start-auction(name:string description:string start-bid:decimal start-time:time end-time:time)
    @doc "Start an auction"
    @model [
      (property (!= name ""))
      (property (!= description ""))
      (property (> start-bid 0.0))
    ]
    (enforce (!= name "") "Name must not be empty")
    (enforce (!= description "") "Description must not be empty")
    (enforce (> start-bid 0.0) "Start bid must be greater than 0.0"))
)

; Make sure that our pre-determined ns_hash has not been changed
(enforce-keyset (format "{}.charity-auction-keyset" [NS_HASH]))

(if (read-msg 'upgrade)
  ["Upgrade successful"]
  [
  ])

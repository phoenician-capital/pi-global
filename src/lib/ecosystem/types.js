/**
 * @typedef {'intelligence'|'portfolio'|'portal'|'ops'|'platform'|'vendor'|'infra'} DomainId
 *
 * @typedef {'project'|'application'|'service'|'database'|'infrastructure'|'external'|'satellite'} NodeKind
 *
 * @typedef {'frontend'|'backend'|'data'|'worker'|'client'|'infra'|'vendor'} TechLayer
 *
 * @typedef {'http_api'|'iframe'|'embed_nav'|'webhook'|'callback'|'jwt_cookie'|'s3_efs'|'database'|'realtime'|'vendor'|'conceptual'|'fork'|'job'|'proxy'} EdgeType
 *
 * @typedef {'confirmed'|'inferred'} Confidence
 *
 * @typedef {Object} EcoNode
 * @property {string} id
 * @property {NodeKind} kind
 * @property {DomainId} domain
 * @property {string} name
 * @property {string} shortName
 * @property {string} purpose
 * @property {string} [why]
 * @property {string[]} stack
 * @property {TechLayer} techLayer
 * @property {string[]} business
 * @property {string[]} tags
 * @property {string[]} [urls]
 * @property {string} [repo]
 * @property {string} [runtime]
 * @property {string[]} [entryPoints]
 * @property {string[]} [modules]
 * @property {string[]} [apis]
 * @property {string[]} [databases]
 * @property {string[]} [callKinds]
 * @property {string} [kb]
 * @property {number} x
 * @property {number} y
 * @property {number} [r]
 *
 * @typedef {Object} EcoEdge
 * @property {string} id
 * @property {string} source
 * @property {string} target
 * @property {EdgeType} type
 * @property {string} label
 * @property {string} description
 * @property {Confidence} confidence
 * @property {string[]} evidence
 * @property {string[]} [endpoints]
 * @property {string[]} [files]
 * @property {string} [callKind]
 * @property {boolean} [bidirectional]
 *
 * @typedef {Object} Journey
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string[]} steps - node ids in order
 * @property {string[]} edgeIds
 * @property {string} business
 */

export {};

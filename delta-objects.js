function isNumber(value) {
    if (isNaN(value)) {
        return false
    }
    var x = parseFloat(value)
    return !isNaN(x)
}

// From https://coderwall.com/p/_g3x9q/how-to-check-if-javascript-object-is-empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function roundFloat(float, decimals = 2){
    const decimalHelper = Math.pow(10, decimals)
    return Math.round(float * decimalHelper) / decimalHelper
}

const defaultIgnoredProperties = ['delta_status', 'deltas']

const deltaProps = (root, prefix, l, r, ignoredProperties) => {
    const props = ((r && Object.getOwnPropertyNames(r)) || (l && Object.getOwnPropertyNames(l)))
    for(const k of props) {
        if (ignoredProperties.indexOf(k) !== -1) { continue }

        let v = r && r[k]
        let v2 = l && l[k]

        if (isNumber(v) || isNumber(v2)) {
            v = v || 0
            v2 = v2 || 0
            
            const left = v2 === Infinity ? Infinity : v2 === -Infinity ? -Infinity : roundFloat(v2)
            const right = v === Infinity ? Infinity : v === -Infinity ? -Infinity : roundFloat(v)

            // Special cases
            if(left === right) {
                // Nothing to do
            }
            if (left === -1 && right !== -1) {
                root.deltas[prefix + k] = 'from -1'
            }
            else if (right === -1 && left !== -1) {
                root.deltas[prefix + k] = `from ${left}`
            }
            else if (left === Infinity && right !== Infinity) {
                root.deltas[prefix + k] = 'from Infinity'
            }
            else if (right === Infinity && left !== Infinity) {
                root.deltas[prefix + k] = `from ${left}`
            }
            else if (left === -Infinity && right !== -Infinity) {
                root.deltas[prefix + k] = `from ${left}`
            }
            else if (right === -Infinity && left !== -Infinity) {
                root.deltas[prefix + k] = 'from Infinity'
            }
            else {
                let delta = right - left
                delta = roundFloat(delta)
                if (delta !== 0) {
                    root.deltas[prefix + k] = delta
                }
            }
        }
        else if (v === true || v === false || v === 'true' || v === 'false' || v2 === true || v2 === false || v2 === 'true' || v2 === 'false') {
            if (v !== v2) {
                root.deltas[prefix + k] = v2 ? 'yes' : 'no'
            }
        }
        else if ((typeof v === 'string' || typeof v2 === 'string') && (v && v.trim().replace('\\n', '')) !== (v2 && v2.trim().replace('\\n', ''))) {
            root.deltas[prefix + k] = v2
        }
        else if ((v !== null || v2 !== null) && (typeof v === 'object' || typeof v2 === 'object')) {
            if ((v && v.constructor.name === 'Array') || (v2 && v2.constructor.name === 'Array')) {
                // Array comparison not implemented yet
            } else {
                deltaProps(root, prefix + k + '.', v2, v, ignoredProperties)
            }
        }
    }
}

/**
 * Compares a base 'left' object with an updated 'right' object and store the status and differences found
 * inside two additional properties:
 * - delta_status: One of 'unchanged', 'modified', 'new' or 'removed'
 * - deltas: Object with one property for each differences found
 *
 *
 * @param {Object}   left                      base object           
 * @param {Object}   right                      updated object
 * @param {Array}   [ignoredProperties=[]]  array of properties to ignore. Can contain nested properties (e.g. given { x: { y: 1 }} you can use ['x.y'] )
 * 
 * @return {Object} IF r is null or undefined, l is returned with l.delta_status === 'removed'
 *                  ELSE l is returned with delta_status and deltas
 */
export function deltaObject(left, right, ignoredProperties = []) {
    if (left === undefined || left === null) {
        right.delta_status = 'new'
        return right
    }
    else if (right === undefined || right === null) {
        left.delta_status = 'removed'
        return left
    }
    else {
        right.deltas = {}
        deltaProps(right, '', left, right, [...ignoredProperties, ...defaultIgnoredProperties])
        right.delta_status = isEmpty(right.deltas) ? 'unchanged' : 'modified'
    }
    return right
}

/**
 * Compare base objects from the 'left' array with updated objects from the 'right' array, matching them using the provided 'key'.
 *
 * @param {Array}   left                    base objects
 * @param {Array}   right                   updated objects
 * @param {String}  key                     property used to pair objects from left and right together
 * @param {Array}   [ignoredProperties=[]]  array of properties to ignore. Can contain nested properties (e.g. given { x: { y: 1 }} you can use ['x.y'] )
 * 
 * @return {Array}  Array of objects that have been removed, modified or added
 */
export function deltaObjects(left, right, key = 'key', ignoredProperties = []) {
    const keys = Array.from(new Set([...left.map(l => l[key]), ...right.map(r => r[key])]))

    const deltas = keys.map(k => {
        const l = left.find(l => l[key] === k)
        const r = right.find(r => r[key] === k)
        return deltaObject(l, r, key, [...ignoredProperties, key, ...defaultIgnoredProperties])
    })

    return deltas.filter(o => o.delta_status !== 'unchanged')
}
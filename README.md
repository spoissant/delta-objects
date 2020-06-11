# delta-objects
Utility methods to identify changes between two 'versions' of a JavaScript object. It is VERY opinionated as it was developed specifically for [twwstats.com](https://twwstats.com) but I figured it could be a good starting point for developers with similar needs

# examples
## deltaObject
```javascript
import { deltaObject } from '.\delta-objects'

const left = {
    prop1: 0,
    prop2: 'foo',
    prop3: {
        prop4: 0.4
    }
}

const right = {
    prop1: 10,
    prop2: 'bar',
    prop3: {
        prop4: 0.5
    }
}

const result = deltaObject(left, right)
// result is the right object with the following added properties:
// - delta_status: 'modified'
// - deltas: { prop1: 10, prop2: 'foo', 'prop3.prop4': 0.1 }
```

## deltaObjects
```javascript
import { deltaObjects } from '.\delta-objects'

// 'key' is used by default to group left and right objects in pairs but a different value can
// be provided to deltaObjects if need be
const left = [
    { key: 0, prop1: 2},
    { key: 1, prop1: 2},
    { key: 2, prop1: 2}
]

const right = [
    { key: 1, prop1: 4},
    { key: 2, prop1: 0},
    { key: 3, prop1: 3}
]

const result = deltaObjects(left, right)
// result is an array of lenght 4 that contains the left object for key === 0 and the right object for the 3 other keys. Each object have the following delta properties defiend:
// - key 0: { delta_status: 'removed', deltas: {} }
// - key 1: { delta_status: 'modified', deltas: { prop1: 2 } }
// - key 2: { delta_status: 'modified', deltas: { prop1: -2 } }
// - key 3: { delta_status: 'new', deltas: {} }
```
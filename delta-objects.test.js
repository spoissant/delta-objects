import { deltaObject, deltaObjects } from './delta-objects'

it("should compare integers", () => {
    const left = { key: 'obj1', i: 0 }
    const right = { key: 'obj1', i : 10 }
    const res = deltaObject(left, right)
    expect(res.deltas['i']).toBe(10)
})

it("should compare floats", () => {
    const left = { key: 'obj1', i: 0.4 }
    const right = { key: 'obj1', i : 0.5 }
    const res = deltaObject(left, right)
    expect(res.deltas['i']).toBe(0.1)
})

it("should compare strings", () => {
    const left = { key: 'obj1', i: 'test_left' }
    const right = { key: 'obj1', i : 'test_right' }
    const res = deltaObject(left, right)
    expect(res.deltas['i']).toBe('test_left')
})

it("should compare Infinity", () => {
    const left = { key: 'obj1', i: Infinity }
    const right = { key: 'obj1', i : 1 }
    const res = deltaObject(left, right)
    expect(res.deltas['i']).toBe('from Infinity')
})

it("should compare nested objects", () => {
    const left = { key: 'obj1', i: { j: 0 } }
    const right = { key: 'obj1', i : { j: 10 } }
    const res = deltaObject(left, right)
    expect(res.deltas['i.j']).toBe(10)
})

it('deltaObject example should be valid', () => {
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

    expect(result.delta_status).toBe('modified')
    expect(result.deltas.prop1).toBe(10)
    expect(result.deltas.prop2).toBe('foo')
    expect(result.deltas['prop3.prop4']).toBe(0.1)
})

it('deltaObjects example should be valid', () => {
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

    expect(result.length).toBe(4)
    expect(result[0].delta_status).toBe('removed')
    expect(result[1].delta_status).toBe('modified')
    expect(result[1].deltas.prop1).toBe(2)
    expect(result[2].delta_status).toBe('modified')
    expect(result[2].deltas.prop1).toBe(-2)
    expect(result[3].delta_status).toBe('new')
})
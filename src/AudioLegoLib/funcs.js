

export function chain(method, ...objects) {
  return objects.reduce((p, c) => {
    p[method](c)
    return c
  })
}


export function initArray(length, initializer=undefined) {
  return Array.from({length}, initializer)
}

export function range(length) {
  return initArray(length, (v, i) => i)
}

function rangep(start, stop, step=1) {
  return initArray(stop - start, (v, i) => start + i * step)
}


// splitIntoN :: Number n -> [a] -> [[a]*n]
export function splitIntoN(n, ary) {
  const
    alen = ary.length,
    modulo = Math.floor(alen / n),
    remainder = alen % n,
    shifting_offset = (x) => Math.min(remainder, x)

  return range(n).map((i) =>
    ary.slice( i    * modulo + shifting_offset(i),
              (i+1) * modulo + shifting_offset(i+1)))
}


export const partial = (fn, ...args) => fn.bind(null, ...args)

// min :: [Number a] -> a
export const min = Function.prototype.apply.bind(Math.min, null)
// max :: [Number a] -> a
export const max = Function.prototype.apply.bind(Math.max, null)


// head :: [x, ...xs] -> x
export const head = ([x, ..._xs]) => x
// tail :: [x, ...xs] -> xs
export const tail = ([_x, ...xs]) => xs

// pipe :: [fs]   -> (...args) -> a
//         [f, g] -> (...args) -> g(f(...args))
//         [(a -> b), (b -> c)] -> a -> c
export const pipe = (f, ...fs) =>
  (...args) => fs.reduce((arg, fn) => fn(arg), f(...args))

// map :: (a -> b) -> [a] -> [b]
export const map = (fn) => (ary) => ary.map(fn)

// juxt :: [fs] -> a -> [b]
//         [(a -> b), (a -> c)] -> a -> [b, c]
export const juxt = (...fs) =>
  (arg) => fs.map(fn => fn(arg))


// maxMinPairs :: [Number a] -> [a, a]
export const maxMinPairs = juxt(max, min)

// dropUntil :: (a -> Boolean) -> [a] -> [a]
export const dropUntil = (fn) =>
  (ary) => ary.slice( ary.findIndex(fn) )

// not :: (a -> b) -> (a -> Boolean)
export const not = (fn) => (x) => !(fn(x))

// dropWhile :: (a -> Boolean) -> [a] -> [a]
export const dropWhile = (fn) => dropUntil(not(fn))

export const trimLeft = dropUntil(Boolean)



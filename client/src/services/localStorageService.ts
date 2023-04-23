const addObject = (key: string, object: object | any) => {
    localStorage.setItem(key, JSON.stringify(object))
}

const getObject = (key: string) => {
    const itemStringified = localStorage.getItem(key)
    if (!itemStringified) return null
    return JSON.parse(itemStringified)
}

export default { addObject, getObject }

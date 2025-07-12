export const truncateFilename=(filename, limit=15)=> {
    const fileSplit = filename.split(".")
    const splitLength = fileSplit.length
    if (splitLength < 2) return filename

    const ext = fileSplit[splitLength - 1]
    fileSplit.pop()

    if (filename.length > limit) {
        return fileSplit.join(".").substring(0, limit) + "." + ext
    }
    return filename
}
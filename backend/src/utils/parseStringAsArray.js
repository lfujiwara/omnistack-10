module.exports = str => {
  if (str instanceof Array) return str.map(substr => substr.trim())
  else return str.split(',').map(substr => substr.trim())
}

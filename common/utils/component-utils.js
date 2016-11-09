export const renderProgress = progress => {
  const floored = Math.floor(progress)
  return (floored < 10 ? '\xa0' : '') + floored + '%'
}

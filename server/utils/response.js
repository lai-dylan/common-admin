export function res(ctx, data = {}, message = 'success') {
  ctx.body = { code: 200, data, message }
}

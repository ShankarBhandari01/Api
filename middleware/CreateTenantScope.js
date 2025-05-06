// middleware/createTenantScope.js
export function createTenantScope(container) {
  return async (req, res, next) => {
    const connection = await getConnectionForTenant(req);
    const scope = container.createScope();

    scope.register({
      connection: asValue(connection),
      orderRepository: asClass(OrderRepository).scoped(),
      orderService: asClass(OrderService).scoped(),
    });

    req.scope = scope; // Attach the scope to the request object
    next();
  };
}

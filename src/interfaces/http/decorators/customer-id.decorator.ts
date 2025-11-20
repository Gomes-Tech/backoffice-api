import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { authorizationToLoginPayload } from '@shared/utils';

export const CustomerId = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const authorization = request.cookies?.['customerAccessToken'];

  const loginPayload = authorizationToLoginPayload(authorization);

  return loginPayload?.id;
});

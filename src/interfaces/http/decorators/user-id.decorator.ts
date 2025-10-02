import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { authorizationToLoginPayload } from '@shared/utils';

export const UserId = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const authorization = request.cookies?.['accessToken'];

  const loginPayload = authorizationToLoginPayload(authorization);

  return loginPayload?.id;
});

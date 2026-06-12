import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_ROUTE } from '../../common/constants';

export const Public = () => SetMetadata(IS_PUBLIC_ROUTE, true);

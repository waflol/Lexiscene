import {
  BadRequestException,
  Injectable,
  type ArgumentMetadata,
  type PipeTransform,
} from '@nestjs/common';
import { ZodError, type ZodType } from 'zod';
import { buildProblem } from '../problem.js';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(
        buildProblem({
          type: 'https://lexiscene.app/problems/validation',
          title: 'Validation failed',
          status: 422,
          code: 'VALIDATION_ERROR',
          detail: 'Request body or query failed schema validation',
          errors: this.flatten(result.error),
        }),
      );
    }
    return result.data;
  }

  private flatten(error: ZodError) {
    return error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
  }
}

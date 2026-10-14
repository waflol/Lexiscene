import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    email: z.email(),
    password: z.string().min(8),
  });
  const pipe = new ZodValidationPipe(schema);

  // Case 1: valid → return parsed data
  it('returns parsed data when valid', () => {
    const result = pipe.transform(
      { email: '2b2asd2@gmail.com', password: 'longenough' },
      { type: 'body' },
    );
    expect(result).toEqual({
      email: '2b2asd2@gmail.com',
      password: 'longenough',
    });
  });

  // Case 2: invalid → throw + problem+json body
  it('throws BadRequestException with problem+json body when invalid', () => {
    try {
      pipe.transform({ email: 'bad', password: 'short' }, { type: 'body' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      const body = (err as BadRequestException).getResponse() as any;
      expect(body).toMatchObject({
        type: expect.stringContaining('validation'),
        status: 422,
        code: 'VALIDATION_ERROR',
      });
      expect(body.errors).toBeInstanceOf(Array);
      expect(body.errors.length).toBeGreaterThan(0);
    }
  });

  // Case 3: nested path with dot notation
  it('flattens nested path with dot notation', () => {
    const nested = z.object({ user: z.object({ email: z.email() }) });
    try {
      new ZodValidationPipe(nested).transform(
        { user: { email: 'bad' } },
        { type: 'body' },
      );
      expect.fail('should have thrown');
    } catch (err) {
      const body = (err as BadRequestException).getResponse() as any;
      expect(body.errors[0].path).toBe('user.email');
    }
  });

  // Case 4: multiple errors
  it('returns multiple errors for multiple invalid fields', () => {
    try {
      pipe.transform({ email: 'bad', password: 'short' }, { type: 'body' });
      expect.fail('should have thrown');
    } catch (err) {
      const body = (err as BadRequestException).getResponse() as any;
      expect(body.errors.length).toBe(2);
      const paths = body.errors.map((e: any) => e.path);
      expect(paths).toEqual(expect.arrayContaining(['email', 'password']));
    }
  });

  // Case 5: empty body
  it('rejects undefined body when schema requires fields', () => {
    try {
      pipe.transform(undefined, { type: 'body' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      const body = (err as BadRequestException).getResponse() as any;
      expect(body.errors.length).toBeGreaterThan(0);
    }
  });
});

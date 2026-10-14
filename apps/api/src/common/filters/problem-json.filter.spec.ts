import {
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProblemJsonFilter } from './problem-json.filter.js';
import { Logger } from '@nestjs/common';

describe('ProblemJsonFilter', () => {
  let filter: ProblemJsonFilter;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockHost: any;

  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    filter = new ProblemJsonFilter();
    const res = {
      status: vi.fn().mockReturnThis(),
      type: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockJson = res.json;
    mockStatus = res.status;
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => res,
        getRequest: () => ({}),
        getNext: () => ({}),
      }),
    };
  });

  it('formats HttpException as problem+json', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost);
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 404,
        code: 'NOT_FOUND',
        type: expect.stringContaining('not-found'),
        title: 'NOT_FOUND',
      }),
    );
  });

  it('passes through pre-formatted problem+json body', () => {
    const problemBody = {
      type: 'https://lexiscene.app/problems/validation',
      title: 'Validation failed',
      status: 422,
      code: 'VALIDATION_ERROR',
      errors: [{ path: 'email', message: 'Invalid' }],
    };
    const exception = new BadRequestException(problemBody);
    filter.catch(exception, mockHost);
    expect(mockJson).toHaveBeenCalledWith(problemBody);
  });

  it('returns generic 500 for unknown errors', () => {
    const exception = new Error('database connection lost');
    filter.catch(exception, mockHost);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        code: 'INTERNAL_ERROR',
      }),
    );
    const body = mockJson.mock.calls[0][0];
    expect(body.detail).toBeUndefined();
  });
});

export enum DtoPrefix {
    EMAIL = 'Email',
    PASSWORD = 'Password',
    DISPLAY_NAME = 'Display Name',
    TITLE = 'Title',
    CONTENT = 'Content',
    STATUS = 'Status',
}

export enum ValidationType {
    NOT_EMPTY = 'should not be empty',
    MUST_BE_STRING = 'must be a string',
    MUST_BE_NUMBER = 'must be a number',
    MUST_BE_EMAIL = 'must be a valid email',
    MAX_LENGTH = 'exceeds maximum length',
    MIN_LENGTH = 'does not meet minimum length',
    NOT_STRONG_ENOUGH = 'is not strong enough',
}

export function getValidationMessage(prefix: DtoPrefix, type: ValidationType, ...args: any[]): string {
    return `${prefix} ${type} ${args.length ? args.join(' ') : ''}`.trim();
}

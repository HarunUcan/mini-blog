import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { DtoPrefix, getValidationMessage, ValidationType } from 'src/common/validation/validation-messages.enum';

export class RegisterDto {
    @IsEmail({}, { message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.MUST_BE_EMAIL) })
    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.NOT_EMPTY) })
    email: string;

    @IsString({ message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.MUST_BE_STRING) })
    @MinLength(8, { message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.MIN_LENGTH, 8) })
    @MaxLength(72, { message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.MAX_LENGTH, 72) })
    password: string;

    @IsString({ message: getValidationMessage(DtoPrefix.DISPLAY_NAME, ValidationType.MUST_BE_STRING) })
    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.DISPLAY_NAME, ValidationType.NOT_EMPTY) })
    @MinLength(2, { message: getValidationMessage(DtoPrefix.DISPLAY_NAME, ValidationType.MIN_LENGTH, 2) })
    @MaxLength(50, { message: getValidationMessage(DtoPrefix.DISPLAY_NAME, ValidationType.MAX_LENGTH, 50) })
    displayName: string;
}

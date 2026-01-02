import { IsNotEmpty, IsString } from 'class-validator';
import { DtoPrefix, getValidationMessage, ValidationType } from 'src/common/validation/validation-messages.enum';

export class LoginDto {
    @IsString({ message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.MUST_BE_STRING) })
    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.NOT_EMPTY) })
    email: string;

    @IsString({ message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.MUST_BE_STRING) })
    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.NOT_EMPTY) })
    password: string;
}

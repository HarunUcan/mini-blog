import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DtoPrefix, getValidationMessage, ValidationType } from 'src/common/validation/validation-messages.enum';

export class CreatePostDto {
    @IsString({ message: getValidationMessage(DtoPrefix.TITLE, ValidationType.MUST_BE_STRING) })
    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.TITLE, ValidationType.NOT_EMPTY) })
    @MaxLength(120, { message: getValidationMessage(DtoPrefix.TITLE, ValidationType.MAX_LENGTH, 120) })
    title: string;

    @IsString({ message: getValidationMessage(DtoPrefix.CONTENT, ValidationType.MUST_BE_STRING) })
    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.CONTENT, ValidationType.NOT_EMPTY) })
    content: string;
}

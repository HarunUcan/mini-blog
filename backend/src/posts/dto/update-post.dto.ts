import { IsOptional, IsString, MaxLength } from 'class-validator';
import { DtoPrefix, getValidationMessage, ValidationType } from 'src/common/validation/validation-messages.enum';

export class UpdatePostDto {
    @IsOptional()
    @IsString({ message: getValidationMessage(DtoPrefix.TITLE, ValidationType.MUST_BE_STRING) })
    @MaxLength(120, { message: getValidationMessage(DtoPrefix.TITLE, ValidationType.MAX_LENGTH, 120) })
    title?: string;

    @IsOptional()
    @IsString({ message: getValidationMessage(DtoPrefix.CONTENT, ValidationType.MUST_BE_STRING) })
    content?: string;
}

import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from "class-validator";
import { isArray, isEmpty, isString } from "lodash";

export function IsNotBlankString(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: IsNotBlankString.name,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: isNotBlankString,
        defaultMessage: (validationArguments?: ValidationArguments): string => {
          return isArray(validationArguments.value)
            ? `each value in ${validationArguments.property} should be a string and not an blank string`
            : `${validationArguments.property} should be a string and not an blank string`;
        },
      },
    });
  };
}

export function isNotBlankString(value: any): boolean {
  return isString(value) && !isEmpty(value.trim());
}

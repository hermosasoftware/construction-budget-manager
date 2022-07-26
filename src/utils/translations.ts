import { TObject } from '../types/global';
import parse from 'html-react-parser';

/**
 * Injects variables into a string
 * Also, converts HTML tags within the string, into a React Elements
 *
 * Variables should follow the pattern => @{variableName}
 * To escape use either '\' or '/' before the '@' => \@{notVariable}
 */
export const interpolate = (
  templateString: string,
  templateVariables: TObject,
): string | JSX.Element | JSX.Element[] => {
  let parsedTemplate: string = interpolateString(
    templateString,
    templateVariables,
  );
  return interpolateHTML(parsedTemplate);
};

/**
 * Injects variables into a string
 *
 * Variables should follow the pattern => @{variableName}
 * To escape use either '\' or '/' before the '@' => \@{notVariable}
 */
export const interpolateString = (
  templateString: string,
  templateVariables: TObject,
) =>
  templateString.replaceAll(/.{0,1}@{([^{}]+)}/g, (keyExpr, key) => {
    const isEscaped = /^(\\|\/)@{.+}$/.test(keyExpr); // \@{notVariable}
    if (isEscaped) {
      return keyExpr.replace(/(\\|\/)/, '');
    } else {
      return keyExpr.replace(
        /@{([^{}]+)}/g,
        templateVariables[key] ?? 'undefined',
      );
    }
  });

/**
 * Converts HTML tags within a string, into a React Elements
 */
export const interpolateHTML = (templateString: string) =>
  parse(templateString);

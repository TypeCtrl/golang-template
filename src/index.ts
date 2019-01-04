import get from 'lodash.get';

export function reReplace(str: string, variables: any) {
  const regex = /{{\s*re_replace\s+(\..+?)\s+\"(.*?)\"\s+\"(.*?)\"\s*}}/;
  let result = str;
  let m;

  while ((m = result.match(regex)) !== null) {
    const all = m[0];
    const prop = m[1];
    const regexp = m[2];
    const newvalue = m[3];

    const replaceRegex = new RegExp(regexp, 'g');
    const input = get(variables, prop.substring(1));
    const expanded = input.replace(replaceRegex, newvalue);

    result = result.replace(all, expanded);
  }
  return result;
}

export function joinReplace(str: string, variables: any) {
  const regex = /{{\s*join\s+\.(.+?)\s+\"(.*?)\"\s*}}/;
  let result = str;
  let m;

  while ((m = result.match(regex)) !== null) {
    const all = m[0];
    const prop = m[1];
    const delimiter = m[2];

    const input: any[] = get(variables, prop);
    const expanded = input.join(delimiter);

    result = result.replace(all, expanded);
  }
  return result;
}

export function ifElseReplace(str: string, variables: any) {
  const regex = /{{\s*if\s*(.+?)\s*}}(.*?){{\s*else\s*}}(.*?){{\s*end\s*}}/;
  let result = str;
  let m;

  while ((m = result.match(regex)) !== null) {
    let conditionResult: string;

    const all: string = m[0];
    const condition: string = m[1];
    const onTrue: string = m[2];
    const onFalse: string = m[3];

    if (condition.startsWith('.')) {
      let conditionResultState = false;
      const value = get(variables, condition.substring(1));
      if (value === null || value === undefined) {
        conditionResultState = false;
      } else if (typeof value === 'string') {
        conditionResultState = value.length > 0;
      } else if (Array.isArray(value)) {
        conditionResultState = value.length > 0;
      } else if (typeof value === 'boolean') {
        conditionResultState = value;
      } else {
        throw new Error(`Unexpceted type for variable ${condition}: ${typeof value}`);
      }
      conditionResult = conditionResultState ? onTrue : onFalse;
    } else {
      throw new Error('Functionality not implemented');
    }
    result = result.replace(all, conditionResult);
  }
  return result;
}

export function rangeReplace(str: string, variables: any) {
  const regex = /{{\s*range\s*(.+?)\s*}}(.*?){{\.}}(.*?){{end}}/;
  let result = str;
  let m;

  while ((m = result.match(regex)) !== null) {
    let expanded = '';

    const all: string = m[0];
    const prop: string = m[1];
    const prefix: string = m[2];
    const postfix: string = m[3];

    for (const value of get(variables, prop.substring(1))) {
      expanded += `${prefix}${value}${postfix}`;
    }

    result = result.replace(all, expanded);
  }
  return result;
}

export function variableReplace(str: string, variables: any) {
  const regex = /{{\s*(\..+?)\s*}}/;
  let result = str;
  let m;

  while ((m = result.match(regex)) !== null) {
    const all = m[0];
    const prop = m[1];

    const value = get(variables, prop.substring(1));
    result = result.replace(all, value);
  }
  return result;
}

export function parse(str: string, variables: any) {
  let result = reReplace(str, variables);
  result = joinReplace(result, variables);
  result = ifElseReplace(result, variables);
  result = rangeReplace(result, variables);
  result = variableReplace(result, variables);
  return result;
}

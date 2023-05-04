import {withNaming} from '@bem-react/classname';

export const NAMESPACE = 'g-storybook-';

export const block = withNaming({n: NAMESPACE, e: '__', m: '_'});

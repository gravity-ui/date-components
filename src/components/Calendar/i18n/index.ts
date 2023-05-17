// @ts-expect-error
import {registerKeyset} from '@gravity-ui/uikit/i18n';

import {NAMESPACE} from '../../../utils/cn';

import en from './en.json';
import ru from './ru.json';

export const i18n = registerKeyset({en, ru}, `${NAMESPACE}calendar`);

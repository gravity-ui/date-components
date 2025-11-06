import {expect, test} from '@playwright/experimental-ct-react';

import {DefaultStory} from './DefaultStory';

const fixTestDate = new Date(1997, 8, 23);

test('Calendar default view', async ({mount}) => {
    const component = await mount(<DefaultStory date={fixTestDate} />);
    await expect(component).toHaveScreenshot();
});

import {rm} from 'node:fs/promises';
import path from 'node:path';

import {addVirtualFile, createTypescriptProject} from '@gravity-ui/gulp-utils';
import {dest, parallel, series, src, task} from 'gulp';
import gulpSass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import * as sass from 'sass';

import packageJson from './package.json' with {type: 'json'};

const BUILD_DIR = path.resolve('dist');
const sassLoader = gulpSass(sass);

task('clean', () => {
    return rm(BUILD_DIR, {recursive: true, force: true});
});

async function compileTs(modules = false) {
    const tsProject = await createTypescriptProject({
        compilerOptions: {
            noEmit: false,
            declaration: true,
            ...(modules ? undefined : {verbatimModuleSyntax: false}),
            module: modules ? 'esnext' : 'NodeNext',
            moduleResolution: modules ? 'bundler' : 'NodeNext',
        },
    });

    const transformers = [
        tsProject.customTransformers.transformScssImports,
        tsProject.customTransformers.transformLocalModules,
    ];

    const {version, sideEffects} = packageJson;
    return new Promise((resolve) => {
        src([
            'src/**/*.{ts,tsx}',
            '!src/demo/**/*',
            '!src/**/__stories__/**/*',
            '!src/**/__tests__/**/*',
            '!src/**/*.test.{ts,tsx}',
        ])
            .pipe(sourcemaps.init())
            .pipe(
                addVirtualFile({
                    fileName: 'src/package.json',
                    text: JSON.stringify({type: modules ? 'module' : 'commonjs'}),
                }),
            )
            .pipe(
                tsProject({
                    customTransformers: {
                        before: transformers,
                        afterDeclarations: transformers,
                    },
                }),
            )
            .pipe(sourcemaps.write('.', {includeContent: true, sourceRoot: '../../src'}))
            .pipe(
                addVirtualFile({
                    fileName: 'package.json',
                    text: JSON.stringify({
                        type: modules ? 'module' : 'commonjs',
                        version,
                        sideEffects,
                    }),
                }),
            )
            .pipe(dest(path.resolve(BUILD_DIR, modules ? 'esm' : 'cjs')))
            .on('end', resolve);
    });
}

task('compile-to-esm', () => {
    return compileTs(true);
});

task('compile-to-cjs', () => {
    return compileTs();
});

task('copy-i18n', () => {
    return src(['src/**/i18n/*.json'])
        .pipe(dest(path.resolve(BUILD_DIR, 'esm')))
        .pipe(dest(path.resolve(BUILD_DIR, 'cjs')));
});

task('styles', () => {
    return src(['src/**/*.scss', '!src/demo/**/*', '!src/**/__stories__/**/*'])
        .pipe(sourcemaps.init())
        .pipe(sassLoader({loadPaths: ['./node_modules/']}).on('error', sassLoader.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.resolve(BUILD_DIR, 'esm')))
        .pipe(dest(path.resolve(BUILD_DIR, 'cjs')));
});

task(
    'build',
    series(['clean', parallel(['compile-to-esm', 'compile-to-cjs']), 'copy-i18n', 'styles']),
);

task('default', series(['build']));

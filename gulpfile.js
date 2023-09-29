import path from 'node:path';

import gulp from 'gulp';
import sass from 'gulp-dart-sass';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import ts from 'gulp-typescript';
import {rimraf} from 'rimraf';

const {dest, parallel, series, src, task} = gulp;

const BUILD_DIR = path.resolve('dist');

task('clean', (done) => {
    rimraf.sync(BUILD_DIR);
    done();
});

function compileTs(modules = false) {
    const tsProject = ts.createProject('tsconfig.json', {
        noEmit: false,
        declaration: true,
        ...(modules ? undefined : {verbatimModuleSyntax: false}),
        module: modules ? 'esnext' : 'commonjs',
        moduleResolution: modules ? 'bundler' : 'node10',
    });

    return src([
        'src/**/*.{ts,tsx}',
        '!src/demo/**/*',
        '!src/**/__stories__/**/*',
        '!src/**/__tests__/**/*',
        '!src/**/*.test.{ts,tsx}',
    ])
        .pipe(replace(/import '.+\.scss';/g, (match) => match.replace('.scss', '.css')))
        .pipe(tsProject())
        .pipe(dest(path.resolve(BUILD_DIR, modules ? 'esm' : 'cjs')));
}

task('compile-to-esm', () => {
    return compileTs(true);
});

task('compile-to-cjs', () => {
    return compileTs();
});

function copyCommonJsPackageJson() {
    return src('templates/package.commonjs.json')
        .pipe(rename({basename: 'package'}))
        .pipe(dest(path.resolve(BUILD_DIR, 'cjs')));
}

task('copy-i18n', () => {
    return src(['src/**/i18n/*.json'])
        .pipe(dest(path.resolve(BUILD_DIR, 'esm')))
        .pipe(dest(path.resolve(BUILD_DIR, 'cjs')));
});

task('styles', () => {
    return src(['src/**/*.scss', '!src/demo/**/*', '!src/**/__stories__/**/*'])
        .pipe(sass({includePaths: ['./node_modules/']}).on('error', sass.logError))
        .pipe(dest(path.resolve(BUILD_DIR, 'esm')))
        .pipe(dest(path.resolve(BUILD_DIR, 'cjs')));
});

task(
    'build',
    series([
        'clean',
        parallel(['compile-to-esm', 'compile-to-cjs', copyCommonJsPackageJson]),
        'copy-i18n',
        'styles',
    ]),
);

task('default', series(['build']));

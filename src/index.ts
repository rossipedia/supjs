import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';

interface ConfigAccessor {
    (config: any): any;
}

interface FileBuilder {
    (config: any): string;
}

export function template(
    strings: TemplateStringsArray,
    ...accessors: ConfigAccessor[]
): FileBuilder  {
    return function (config: any): string {
        var result = [strings[0]];
        accessors.forEach((accessor, i) => {
            var value = accessor(config);
            result.push(value, strings[i + 1]);
        });
        return result.join('');
    };
}

export interface Scaffold {
    files: {
        [path: string]: (config: any) => string;
    },
    outdir: string;
    installDev?: string[];
    install?: string[];
}

export function build(config: any, scaffold: Scaffold) {

    if ((scaffold.install || scaffold.installDev) && !scaffold.files['package.json']) {
        console.error('Must include package.json in scaffold.files to use install or installDev');
        process.exit(-1);
    }

    mkdirp.sync(scaffold.outdir);

    const files = Object.keys(scaffold.files);
    for (let file of files) {
        const builder = scaffold.files[file];
        const code = builder(config);
        const fullPath = path.resolve(scaffold.outdir, file);
        const folder = path.dirname(fullPath);
        mkdirp.sync(folder);
        fs.writeFileSync(fullPath, code, 'utf-8');
    }

    if (scaffold.install || scaffold.installDev) {
    }
}
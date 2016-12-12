import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as childProc from 'child_process';
import * as rimraf from 'rimraf';

interface ConfigAccessor<TConfig> {
    (config: TConfig): any;
}

interface FileBuilder {
    (config?: any): string;
}

interface Options<TConfig> {
    outdir?: string;
    config?: TConfig;
}

class Sup<TConfig> {
    private files: Map<string, FileBuilder> = new Map();

    private packages: Set<string> = new Set();
    private devPackages: Set<string> = new Set();

    template(
        strings: TemplateStringsArray, 
        ...accessors: ConfigAccessor<TConfig>[]): FileBuilder
    {
        return function (config: TConfig): string {
            var result = [strings[0]];
            accessors.forEach((accessor, i) => {
                var value = accessor(config);
                result.push(value, strings[i + 1]);
            });
            return result.join('');
        };
    }

    define(path: string, builder: FileBuilder | string) {
        if (this.files.has(path))
            throw new Error(`A file with the path ${path} has already been defined`);
        
        if (typeof builder === 'string')
            this.files.set(path, () => builder);
        else
            this.files.set(path, builder);
    }

    install(...pkgs: string[]) {
        for (let pkg of pkgs) {
            this.packages.add(pkg);
        }
    }

    installDev(...pkgs: string[]) {
        for (let pkg of pkgs) {
            this.devPackages.add(pkg);
        }
    }

    build(opts?: Options<TConfig>) {
        if (this.hasPackages() && !this.files.has('package.json')) {
            throw new Error('Must include package.json in scaffold.files to use install or installDev');
        }           

        const outdir = path.resolve((opts && opts.outdir) || process.cwd());

        // const contents = fs.readdirSync(outdir);
        // if (contents.length > 0) {
        //     throw new Error('Target folder must be empty');
        // }

        buildAndWriteFiles(outdir, this.files, opts && opts.config);
        if (this.hasPackages()) {
            installPackages(this.devPackages, outdir, true);
            installPackages(this.packages, outdir);
        }
    }

    hasPackages() {
        return this.packages.size > 0 || this.devPackages.size > 0;
    }
}

function buildAndWriteFiles(
    outdir: string, 
    files: Map<string, FileBuilder>,
    config?: any): void {
    for (let [name, builder] of files.entries()) {
        const contents = builder(config || undefined);
        const fullpath = path.resolve(outdir, name);
        const folder = path.dirname(fullpath);
        
        mkdirp.sync(folder);
        console.log(`Creating ${fullpath}`);
        fs.writeFileSync(fullpath, contents, 'utf8');
    }
}

function installPackages(
    packages: Set<string>,
    outdir: string,
    dev?: boolean): void {
    const flags: string[] = [];
    if (dev)
        flags.push('--dev');
    const args = ['yarn', 'add', ...flags, ...packages];
    const cmdline = args.join(' ');
    console.log(`Running: ${cmdline}...`);
    childProc.execSync(cmdline, { cwd: outdir, stdio: 'ignore' });
    console.log(`Complete.`)
}


module.exports = Sup;
export default Sup;
Sup['default'] = Sup;
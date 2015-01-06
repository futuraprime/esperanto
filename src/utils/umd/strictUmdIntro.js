import { globalify, quote, req } from 'utils/mappers';

export default function strictUmdIntro ( options, indentStr ) {
	var intro, amdName, needsGlobal, defaultsBlock = '', amdDeps, cjsDeps, globalDeps, args, cjsDefine, globalDefine, nonAMDDefine;

	amdName     = options.amdName ? `'${options.amdName}', ` : '';
	needsGlobal = options.hasImports || options.hasExports;

	amdDeps     = ( options.hasExports ? [ 'exports' ]    : [] ).concat( options.importPaths ).map( quote ).join( ', ' );
	cjsDeps     = ( options.hasExports ? [ 'exports' ]    : [] ).concat( options.importPaths.map( req ) ).join( ', ' );
	globalDeps  = ( options.hasExports ? [ options.name ] : [] ).concat( options.importNames ).map( globalify ).join( ', ' );

	args        = ( options.hasExports ? [ 'exports' ]    : [] ).concat( options.importNames ).join( ', ' );

	if ( options.externalDefaults && options.externalDefaults.length > 0 ) {
		defaultsBlock = options.externalDefaults.map( name =>
			`\tvar ${name}__default = ('default' in ${name} ? ${name}['default'] : ${name});`
		).join( '\n' ) + '\n\n';
	}

	cjsDefine =`factory(${cjsDeps})`;

	globalDefine = options.hasExports ?
		`(global.${options.name} = {}, factory(${globalDeps}))` :
		`factory(${globalDeps})`;

	nonAMDDefine = cjsDefine === globalDefine ? globalDefine :
		`typeof exports === 'object' ? ${cjsDefine} :\n\t${globalDefine}`;

	intro =
`(function (${needsGlobal ? 'global, ' : ''}factory) {
	typeof define === 'function' && define.amd ? define(${amdName}${amdDeps ? '[' + amdDeps + '], ' : ''}factory) :
	${nonAMDDefine}
}(${needsGlobal ? 'this, ' : ''}function (${args}) { 'use strict';

${defaultsBlock}`.replace( /\t/g, indentStr );

	return intro;
}
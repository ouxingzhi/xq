module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/* <%=pkg.name%> <%=pkg.version%> <%= grunt.template.today("yyyy-mm-dd")%> */\r\n',
				compress: true,
				mangle: true
			},
			build: {
				expand: true,
				cwd: 'src/',
				src: '**/*.js',
				dest: 'build/'
			}
		},
		clean: ['build/*', 'docs/*'],
		jshint: {
			
			options: {
				undef: true,
				browser: true,
				devel: true
			},
			all: ['src/**/*.js']
		},
		yuidoc: {
			name: "<%=pkg.name%>",
			version: "<%=pkg.version%>",
			options: {
				paths: "src/",
				outdir: "docs/"
			}
		},
		concat: {
			normal: {
				src:[
					'../oquery/src/oquery.js',
					'src/*.js'
				],
				dest: 'build/xq.debug.js'
			}
		}
	});

	//加载库
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');


	//执行默认任务
	grunt.registerTask('default', ['clean', 'concat', 'uglify', 'yuidoc']);
};

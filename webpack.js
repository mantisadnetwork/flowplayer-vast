var webpack = require('webpack');
var path = require('path');

module.exports = {
	entry: './src/vast',
	output: {
		filename: "dist/vast.min.js"
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	],
	module: {
		loaders: [
			{test: /\.js?$/, loaders: ['transform?brfs', 'babel-loader']}
		]
	}
};
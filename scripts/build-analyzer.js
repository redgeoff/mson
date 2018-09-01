// Performs a production build and generates a report so that large dependencies can be identified.
//
// Usage: node build-analyzer
//
// Source: https://github.com/facebook/create-react-app/issues/3518#issue-277616195

process.env.NODE_ENV = "production"
var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin

const webpackConfigProd = require("react-scripts/config/webpack.config.prod")

webpackConfigProd.plugins.push(
  new BundleAnalyzerPlugin({
    analyzerMode: "static",
    reportFilename: "report.html",
  })
)

require("react-scripts/scripts/build")

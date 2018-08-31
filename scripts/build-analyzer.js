// Performs a production build and generates a report so that large dependencies can be identified.
//
// Usage: node build-analyzer

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

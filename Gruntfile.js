module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-aws-lambda');
  grunt.initConfig({
    lambda_invoke: {
      default: {
        options: {}
      }
    },
    lambda_package: {
      default: {
        options: {}
      }
    },
    lambda_deploy: {
      default: {
        arn: "arn:aws:lambda:us-west-2:515485644548:function:s2l"
      }
    },
  });
}
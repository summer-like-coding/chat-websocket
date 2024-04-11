import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  rules: {
    'curly': 'off',
    'style/brace-style': 'off',
  },
})

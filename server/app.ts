import { createRequestHandler } from 'react-router'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — virtual module resolved at build time
import * as build from 'virtual:react-router/server-build'

export default createRequestHandler(build)

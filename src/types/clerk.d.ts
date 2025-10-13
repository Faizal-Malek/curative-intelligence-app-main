declare module '@clerk/nextjs/server' {
  // Minimal typing for clerk server SDK used in this project.
  // Prefer installing official types or the full Clerk package in production.
  const clerk: any
  export { clerk as clerkClient }
  export default clerk
}

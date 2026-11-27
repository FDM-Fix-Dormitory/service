function checkEnv(env: NodeJS.ProcessEnv) {
  if (!env.PORT) return false;
  return true;
}

export { checkEnv };

const requiredMajor = 22;
const currentMajor = Number(process.versions.node.split(".")[0]);

if (currentMajor !== requiredMajor) {
  console.error(
    `ArchiCompass builds require Node ${requiredMajor}. Current version: ${process.versions.node}. Switch to Node ${requiredMajor} (see .nvmrc) and run the command again.`,
  );
  process.exit(1);
}

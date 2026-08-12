# S3 / EFS keys — PI Python (v4)

| template | meaning |
|----------|---------|
| `companies/{ticker}/` | main artefacts |
| `companies/{ticker}/cheap/…` | DeepSeek cheap path |
| `raw_data/{ticker}/` | collected inputs |
| `efs-uploads/{raw_data\|companies}/{uuid}/{name}` | zip ingest |
| `efs-uploads/adhoc/{batch_id}/{idx}` | multi-file |
| `chatbot-uploads/{session}/{file_id}_{safe}` | chat files |
| S3 `{ticker}/{rel}`; comps `{ticker}/competitors/{file}` | company bucket PDFs |

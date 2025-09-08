# SECURITY.md

Use this document as a checklist at every stage of development and deployment. It defines the project’s data privacy and security principles.

## Data classification

* Original files: PDFs, images, and CSVs uploaded by users. Do not store. Destroy immediately after processing.
* Extracted data: de-identified fields such as amounts, rates, and usage. May be stored.
* Derived data: simulation results and summary text. May be stored.

## Collection and retention

* Default policy: process originals only in memory or temporary storage and delete as soon as processing completes.
* Retention is allowed only when debug mode is explicitly enabled, and for less than 24 hours. Default is 0 hours.
* After upload, generate a file hash to prevent duplicate uploads. Store the hash in a de-identified form.

## Processing principles

* OCR, information extraction, and classification are client-first. Send only extracted fields to external LLMs.
* Do not include PII or full original text in LLM prompts.
* Outputs must pass a token limit and a blocked-terms filter.

## Storage security

* Enable Supabase Row Level Security. Allow access only to rows where user\_id matches.
* Encrypt sensitive columns when needed. Store backups encrypted.

## Access control

* Roles: anonymous, user. Admin role is used only in operational tools.
* Session tokens must be httpOnly, secure, and sameSite=strict.

## Logging and monitoring

* Do not log PII. Log only de-identified values such as amounts and rates.
* Log only error codes and stacks. User-facing messages must use generalized wording.

## Secrets management

* Keep API keys only in server environment variables. Do not inject into the client.
* Key rotation interval: 30 days. Revoke immediately if compromise is suspected.

## Vulnerability disclosure

* Report security issues to [jj49408293@gmail.com](mailto:jj49408293@gmail.com). First response target within 72 hours.

## Compliance disclaimer

* This tool provides information only. It is not legal or financial advice. Users are responsible for how they use the results.&#x20;

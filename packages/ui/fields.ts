/**
 * @module @projective/ui/fields
 * Input-aware field mechanics — TextField, SelectField, ComboboxField, MoneyField, DateField,
 * Checkbox, Switch, StatusSlider, SliderField, TagInput, FileDrop, RichTextField, … — plus the
 * context-aware structure wrappers (LabelWrapper, MessageWrapper, AdornmentWrapper, SkeletonWrapper)
 * that every field composes for a unified label / helper-text / adornment / validation shell.
 *
 * Consolidation note: fields physically live in `packages/fields` today and are re-exported here so
 * consumers can adopt the `@projective/ui/fields` namespace now; the source relocates under
 * `packages/ui/fields/` in the migration pass. Date/time PICKERS are moving to `@projective/ui/time`.
 */
export * from '@projective/fields';

const FIELD_REGISTRY = {
	//   text: TextField,
	//   email: TextField,
	//   select: SelectField,
	//   slider: SliderField,
};

export function DynamicField(props: FieldSchema) {
	const Component = FIELD_REGISTRY[props.type];

	if (!Component) return null;

	return <Component {...props} />;
}

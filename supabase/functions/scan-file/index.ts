import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
		);

		const { fileId } = await req.json();
		if (!fileId) throw new Error('Missing fileId');

		const { data: file, error: fetchError } = await supabaseClient
			.schema('files')
			.from('items')
			.select('*')
			.eq('id', fileId)
			.single();

		if (fetchError || !file) throw new Error('File not found');
		if (file.status === 'clean') {
			return new Response(JSON.stringify({ message: 'Already clean' }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		await supabaseClient
			.schema('files')
			.from('items')
			.update({ status: 'scanning' })
			.eq('id', fileId);

		const isClean = true;

		if (!isClean) {
			// ... (Handle infection logic: delete & flag)
			throw new Error('Virus detected');
		}

		console.log(`Moving ${file.storage_path} from Quarantine to ${file.target_bucket}...`);

		const { data: fileBlob, error: downError } = await supabaseClient.storage
			.from('quarantine')
			.download(file.storage_path);

		if (downError) throw downError;

		const { error: upError } = await supabaseClient.storage
			.from(file.target_bucket)
			.upload(file.target_path, fileBlob, {
				contentType: file.mime_type,
				upsert: true,
			});

		if (upError) throw upError;

		await supabaseClient.storage
			.from('quarantine')
			.remove([file.storage_path]);

		const { data: updated, error: updateError } = await supabaseClient
			.schema('files')
			.from('items')
			.update({
				bucket_id: file.target_bucket,
				storage_path: file.target_path,
				status: 'clean',
				updated_at: new Date().toISOString(),
			})
			.eq('id', fileId)
			.select()
			.single();

		if (updateError) throw updateError;

		return new Response(
			JSON.stringify(updated),
			{ headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
		);
		// deno-lint-ignore no-explicit-any
	} catch (error: any) {
		console.error(error);
		return new Response(
			JSON.stringify({ error: error.message }),
			{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
		);
	}
});

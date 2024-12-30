import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function logToDatabase(supabase: any, series_id: string, status: string, message?: string) {
  try {
    const { error } = await supabase
      .from('macro_data_logs')
      .insert([{ 
        series_id,
        status,
        message: message || null,
        timestamp: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Error logging to database:', error);
    }
  } catch (error) {
    console.error('Error logging to database:', error);
  }
}

export async function clearMacroData(supabase: any): Promise<void> {
  try {
    console.log('Clearing macro_data table...');
    const { error } = await supabase
      .from('macro_data')
      .delete()
      .neq('id', 0); // Delete all records

    if (error) {
      console.error('Error clearing macro_data table:', error);
      throw error;
    }
    console.log('Successfully cleared macro_data table');
  } catch (error) {
    console.error('Error in clearMacroData:', error);
    throw error;
  }
}
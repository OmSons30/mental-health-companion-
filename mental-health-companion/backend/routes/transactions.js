const express = require('express');
const { supabase } = require('../config/supabase');
const { validateTransaction } = require('../middleware/validation');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Private
 */
router.post('/', authenticateUser, validateTransaction, async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;
    const userId = req.user.id;

    const transactionData = {
      user_id: userId,
      amount: parseFloat(amount),
      type,
      category: category || 'Uncategorized',
      description: description || '',
      date: date || new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      console.error('Transaction creation error:', error);
      return res.status(400).json({
        error: 'Transaction creation failed',
        message: error.message
      });
    }

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: data
    });

  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create transaction'
    });
  }
});

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions for the authenticated user
 * @access  Private
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, category, start_date, end_date } = req.query;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (start_date) {
      query = query.gte('date', start_date);
    }
    if (end_date) {
      query = query.lte('date', end_date);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: transactions, error, count } = await query;

    if (error) {
      console.error('Transaction fetch error:', error);
      return res.status(400).json({
        error: 'Failed to fetch transactions',
        message: error.message
      });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch transactions'
    });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get a specific transaction by ID
 * @access  Private
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Transaction not found',
          message: 'The requested transaction does not exist'
        });
      }
      console.error('Transaction fetch error:', error);
      return res.status(400).json({
        error: 'Failed to fetch transaction',
        message: error.message
      });
    }

    res.json({
      transaction
    });

  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch transaction'
    });
  }
});

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update a transaction
 * @access  Private
 */
router.put('/:id', authenticateUser, validateTransaction, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, type, category, description, date } = req.body;

    // First check if transaction exists and belongs to user
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingTransaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'The requested transaction does not exist or you do not have permission to modify it'
      });
    }

    const updateData = {
      amount: parseFloat(amount),
      type,
      category: category || 'Uncategorized',
      description: description || '',
      date: date || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Transaction update error:', error);
      return res.status(400).json({
        error: 'Transaction update failed',
        message: error.message
      });
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });

  } catch (error) {
    console.error('Transaction update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update transaction'
    });
  }
});

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction
 * @access  Private
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First check if transaction exists and belongs to user
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingTransaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'The requested transaction does not exist or you do not have permission to delete it'
      });
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Transaction deletion error:', error);
      return res.status(400).json({
        error: 'Transaction deletion failed',
        message: error.message
      });
    }

    res.json({
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Transaction deletion error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete transaction'
    });
  }
});

/**
 * @route   GET /api/transactions/summary
 * @desc    Get transaction summary/statistics
 * @access  Private
 */
router.get('/summary', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date } = req.query;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (start_date) {
      query = query.gte('date', start_date);
    }
    if (end_date) {
      query = query.lte('date', end_date);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Transaction summary error:', error);
      return res.status(400).json({
        error: 'Failed to fetch transaction summary',
        message: error.message
      });
    }

    // Calculate summary statistics
    const summary = {
      total_transactions: transactions.length,
      total_income: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0),
      total_expenses: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0),
      net_amount: transactions.reduce((sum, t) => {
        const amount = parseFloat(t.amount);
        return t.type === 'income' ? sum + amount : sum - amount;
      }, 0),
      by_category: {},
      by_type: {
        income: 0,
        expense: 0,
        transfer: 0
      }
    };

    // Group by category and type
    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      
      // By category
      if (!summary.by_category[transaction.category]) {
        summary.by_category[transaction.category] = 0;
      }
      summary.by_category[transaction.category] += amount;
      
      // By type
      summary.by_type[transaction.type]++;
    });

    res.json({
      summary
    });

  } catch (error) {
    console.error('Transaction summary error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate transaction summary'
    });
  }
});

module.exports = router; 
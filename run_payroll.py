#!/usr/bin/env python3
"""
Standalone script to run payroll calculator
"""

import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Now import and run
from payroll_report import main

if __name__ == '__main__':
    main()


/**
 * Size Guide Modal Component
 * Adds a comprehensive size guide modal to any page
 * Usage: Include this script at the end of your HTML body
 */

(function() {
  'use strict';

  // Check if modal already exists
  if (document.getElementById('sizeGuideModal')) {
    console.log('Size guide modal already exists');
    return;
  }

  // Create modal HTML
  const modalHTML = `
    <!-- Size Guide Modal -->
    <div class="modal fade" id="sizeGuideModal" tabindex="-1" aria-labelledby="sizeGuideModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="sizeGuideModalLabel">
              <i class="bi bi-rulers"></i> Size Guide & Measurement Instructions
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Measurement Instructions -->
            <div class="measurement-section">
              <h6 class="measurement-title">How to Measure</h6>
              <p class="measurement-intro">For the most accurate fit, measure yourself and compare with our size chart below.</p>
              
              <div class="row g-4 mb-4">
                <div class="col-md-6">
                  <div class="measurement-card">
                    <div class="measurement-icon">
                      <i class="bi bi-person-arms-up"></i>
                    </div>
                    <h6>Chest</h6>
                    <p>Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="measurement-card">
                    <div class="measurement-icon">
                      <i class="bi bi-arrows-expand"></i>
                    </div>
                    <h6>Waist</h6>
                    <p>Measure around your natural waistline, keeping the tape comfortably loose.</p>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="measurement-card">
                    <div class="measurement-icon">
                      <i class="bi bi-arrow-down-up"></i>
                    </div>
                    <h6>Hips</h6>
                    <p>Measure around the fullest part of your hips, keeping the tape horizontal.</p>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="measurement-card">
                    <div class="measurement-icon">
                      <i class="bi bi-arrow-bar-up"></i>
                    </div>
                    <h6>Shoulder</h6>
                    <p>Measure from one shoulder edge to the other across your back.</p>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="measurement-card">
                    <div class="measurement-icon">
                      <i class="bi bi-arrow-right"></i>
                    </div>
                    <h6>Sleeve Length</h6>
                    <p>Measure from shoulder seam to wrist with arm slightly bent.</p>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="measurement-card">
                    <div class="measurement-icon">
                      <i class="bi bi-arrows-vertical"></i>
                    </div>
                    <h6>Length</h6>
                    <p>Measure from the highest point of shoulder to the hem.</p>
                  </div>
                </div>
              </div>

              <!-- Measurement Tips -->
              <div class="measurement-tips">
                <h6><i class="bi bi-lightbulb"></i> Measurement Tips</h6>
                <ul>
                  <li>Use a soft measuring tape for accurate measurements</li>
                  <li>Wear fitted clothing or measure directly on skin</li>
                  <li>Keep the tape parallel to the floor</li>
                  <li>Don't pull the tape too tight - it should be snug but comfortable</li>
                  <li>Ask someone to help you for more accurate measurements</li>
                </ul>
              </div>
            </div>

            <!-- Size Charts -->
            <div class="size-charts-section mt-4">
              <!-- Men's Size Chart -->
              <div class="size-chart-container">
                <h6 class="size-chart-title">
                  <i class="bi bi-gender-male"></i> Men's Size Chart
                </h6>
                <div class="table-responsive">
                  <table class="table table-bordered size-table">
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>Chest (inches)</th>
                        <th>Waist (inches)</th>
                        <th>Hips (inches)</th>
                        <th>Shoulder (inches)</th>
                        <th>Sleeve (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>XS</strong></td>
                        <td>34-36</td>
                        <td>28-30</td>
                        <td>34-36</td>
                        <td>16.5</td>
                        <td>32</td>
                      </tr>
                      <tr>
                        <td><strong>S</strong></td>
                        <td>36-38</td>
                        <td>30-32</td>
                        <td>36-38</td>
                        <td>17</td>
                        <td>33</td>
                      </tr>
                      <tr>
                        <td><strong>M</strong></td>
                        <td>38-40</td>
                        <td>32-34</td>
                        <td>38-40</td>
                        <td>17.5</td>
                        <td>34</td>
                      </tr>
                      <tr>
                        <td><strong>L</strong></td>
                        <td>40-42</td>
                        <td>34-36</td>
                        <td>40-42</td>
                        <td>18</td>
                        <td>35</td>
                      </tr>
                      <tr>
                        <td><strong>XL</strong></td>
                        <td>42-44</td>
                        <td>36-38</td>
                        <td>42-44</td>
                        <td>18.5</td>
                        <td>36</td>
                      </tr>
                      <tr>
                        <td><strong>XXL</strong></td>
                        <td>44-46</td>
                        <td>38-40</td>
                        <td>44-46</td>
                        <td>19</td>
                        <td>37</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Women's Size Chart -->
              <div class="size-chart-container mt-4">
                <h6 class="size-chart-title">
                  <i class="bi bi-gender-female"></i> Women's Size Chart
                </h6>
                <div class="table-responsive">
                  <table class="table table-bordered size-table">
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>Bust (inches)</th>
                        <th>Waist (inches)</th>
                        <th>Hips (inches)</th>
                        <th>Shoulder (inches)</th>
                        <th>Sleeve (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>XS</strong></td>
                        <td>32-34</td>
                        <td>24-26</td>
                        <td>34-36</td>
                        <td>14</td>
                        <td>30</td>
                      </tr>
                      <tr>
                        <td><strong>S</strong></td>
                        <td>34-36</td>
                        <td>26-28</td>
                        <td>36-38</td>
                        <td>14.5</td>
                        <td>31</td>
                      </tr>
                      <tr>
                        <td><strong>M</strong></td>
                        <td>36-38</td>
                        <td>28-30</td>
                        <td>38-40</td>
                        <td>15</td>
                        <td>32</td>
                      </tr>
                      <tr>
                        <td><strong>L</strong></td>
                        <td>38-40</td>
                        <td>30-32</td>
                        <td>40-42</td>
                        <td>15.5</td>
                        <td>33</td>
                      </tr>
                      <tr>
                        <td><strong>XL</strong></td>
                        <td>40-42</td>
                        <td>32-34</td>
                        <td>42-44</td>
                        <td>16</td>
                        <td>34</td>
                      </tr>
                      <tr>
                        <td><strong>XXL</strong></td>
                        <td>42-44</td>
                        <td>34-36</td>
                        <td>44-46</td>
                        <td>16.5</td>
                        <td>35</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Fit Guide -->
              <div class="fit-guide mt-4">
                <h6><i class="bi bi-info-circle"></i> Fit Guide</h6>
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="fit-card">
                      <h6>Slim Fit</h6>
                      <p>Tailored close to the body for a modern, streamlined look.</p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="fit-card">
                      <h6>Regular Fit</h6>
                      <p>Classic fit with room for comfort and easy movement.</p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="fit-card">
                      <h6>Relaxed Fit</h6>
                      <p>Loose and comfortable with extra room throughout.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Size Conversion -->
              <div class="size-conversion mt-4">
                <h6><i class="bi bi-globe"></i> International Size Conversion</h6>
                <div class="table-responsive">
                  <table class="table table-bordered size-table">
                    <thead>
                      <tr>
                        <th>US</th>
                        <th>UK</th>
                        <th>EU</th>
                        <th>Japan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>XS</td>
                        <td>6</td>
                        <td>34</td>
                        <td>S</td>
                      </tr>
                      <tr>
                        <td>S</td>
                        <td>8</td>
                        <td>36</td>
                        <td>M</td>
                      </tr>
                      <tr>
                        <td>M</td>
                        <td>10</td>
                        <td>38</td>
                        <td>L</td>
                      </tr>
                      <tr>
                        <td>L</td>
                        <td>12</td>
                        <td>40</td>
                        <td>LL</td>
                      </tr>
                      <tr>
                        <td>XL</td>
                        <td>14</td>
                        <td>42</td>
                        <td>3L</td>
                      </tr>
                      <tr>
                        <td>XXL</td>
                        <td>16</td>
                        <td>44</td>
                        <td>4L</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Insert modal into DOM when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      console.log('✅ Size guide modal added to page');
    });
  } else {
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ Size guide modal added to page');
  }

})();

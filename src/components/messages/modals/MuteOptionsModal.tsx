"use client";

import React from 'react';

const MuteOptionsModal = () => {
  return (
    <div className="modal fade" tabIndex={-1} id="muteOptions">
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title">Mute Conversation</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <ul className="tyn-media-list gap gap-3">
              <li>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="muteFor" id="muteFor-15m" />
                  <label className="form-check-label" htmlFor="muteFor-15m">
                    <div className="tyn-media tyn-media-1x tyn-media-middle">
                      <div className="tyn-media-col">
                        <div className="tyn-media-row">
                          <span className="tyn-media-title">For 15 minutes</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </li>
              <li>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="muteFor" id="muteFor-1h" />
                  <label className="form-check-label" htmlFor="muteFor-1h">
                    <div className="tyn-media tyn-media-1x tyn-media-middle">
                      <div className="tyn-media-col">
                        <div className="tyn-media-row">
                          <span className="tyn-media-title">For 1 hour</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </li>
              <li>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="muteFor" id="muteFor-8h" />
                  <label className="form-check-label" htmlFor="muteFor-8h">
                    <div className="tyn-media tyn-media-1x tyn-media-middle">
                      <div className="tyn-media-col">
                        <div className="tyn-media-row">
                          <span className="tyn-media-title">For 8 hours</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </li>
              <li>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="muteFor" id="muteFor-1w" />
                  <label className="form-check-label" htmlFor="muteFor-1w">
                    <div className="tyn-media tyn-media-1x tyn-media-middle">
                      <div className="tyn-media-col">
                        <div className="tyn-media-row">
                          <span className="tyn-media-title">For 1 week</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </li>
              <li>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="muteFor" id="muteFor-always" defaultChecked />
                  <label className="form-check-label" htmlFor="muteFor-always">
                    <div className="tyn-media tyn-media-1x tyn-media-middle">
                      <div className="tyn-media-col">
                        <div className="tyn-media-row">
                          <span className="tyn-media-title">Until I turn it back on</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </li>
            </ul>
          </div>
          <div className="modal-footer border-0">
            <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" className="btn btn-sm btn-primary" data-bs-dismiss="modal">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuteOptionsModal;